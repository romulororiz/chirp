import { clerkClient } from "@clerk/nextjs/server";
import type { Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { z } from "zod";
import { filterUserForClient } from "~/helpers/filterUserForClient";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";

const addUserDataToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const user = users.find((user) => user.id === post.authorId);

    if (!user || !user.username) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "User not found",
      });
    }

    return {
      post,
      user: {
        ...user,
        username: user.username,
      },
    };
  });
};

// Create a new ratelimiter, that allows 3 requests per 60 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(3, "1 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  // Get all posts
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });

    return addUserDataToPosts(posts);
  }),

  // Create a new post
  create: privateProcedure
    .input(
      z.object({
        content: z.string().emoji("Only emojis are allowed!").min(1).max(280),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const authorId = ctx.userId;
      const content = input.content;

      const { success } = await ratelimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You are posting too fast!",
        });
      }

      const post = await ctx.prisma.post.create({
        data: {
          authorId,
          content,
        },
      });

      return post;
    }),

  // Get User Posts
  getPostsByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.post
        .findMany({
          where: {
            authorId: input.userId,
          },
          take: 100,
          orderBy: {
            createdAt: "desc",
          },
        })
        .then(addUserDataToPosts)
    ),
});
