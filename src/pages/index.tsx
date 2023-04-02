import {
  SignInButton,
  SignOutButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { type NextPage } from "next";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import Image from "next/image";
import { LoadingPage, LoadingSpinner } from "~/components/Loading";
import { cn } from "~/utils/cn";
import Link from "next/link";
import { PageLayout } from "~/components/layout";
import { PostsView } from "~/components/PostView";

const CreatePostWizard = () => {
  const [input, setInput] = useState("");

  const { user } = useUser();

  // get cached post data
  const ctx = api.useContext();

  const { mutate: createPost, isLoading: isPosting } =
    api.posts.create.useMutation({
      onSuccess: () => {
        setInput("");
        // invalidate the query to refetch the data
        void ctx.posts.getAll.invalidate();
      },
      onError: (err) => {
        const errorMessageValidation = err.data?.zodError?.fieldErrors?.content;

        if (errorMessageValidation && errorMessageValidation[0]) {
          return toast.error(errorMessageValidation[0]);
        } else {
          return toast.error(err.message);
        }
      },
    });

  // Explicitly check for username because of template literal in Link href
  if (!user || !user.username) return null;

  return (
    <div className="flex w-full items-center gap-3 border-b border-slate-400 p-4 ">
      <Link href={`/@${user.username}`}>
        <Image
          src={user.profileImageUrl}
          alt="Profile Image"
          className="h-14 w-14 rounded-full"
          width={56}
          height={56}
        />
      </Link>
      <input
        type="text"
        placeholder={isPosting ? "" : "Type some emojis!"}
        className={cn(
          "h-10 grow rounded-md bg-gray-600/40 pl-3 text-sm outline-none placeholder:text-slate-100/30",
          {
            "cursor-not-allowed rounded-md bg-gray-600/40": isPosting,
          }
        )}
        value={input}
        disabled={isPosting}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            createPost({ content: input });
          }
        }}
      />
      <button
        className={cn(
          "flex h-fit items-center rounded-md bg-[#1da1f2] px-3 py-1 text-slate-100",
          {
            "cursor-not-allowed bg-slate-200/80": isPosting,
          }
        )}
        disabled={isPosting}
        onClick={() => createPost({ content: input })}
      >
        {isPosting && (
          <span className="mr-2">
            <LoadingSpinner size={14} />
          </span>
        )}
        Post
      </button>
    </div>
  );
};

// --------------------------------------------

const Feed = () => {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostsView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

// --------------------------------------------

const Home: NextPage = () => {
  const { isLoaded: userLoaded, isSignedIn } = useUser();

  // Start fetching asap
  api.posts.getAll.useQuery();

  // Return empty div if user isn't loaded yet to prevent flash of unauthenticated content
  if (!userLoaded) return <div />;

  return (
    <PageLayout>
      {!isSignedIn && (
        <div className="flex w-full justify-start border-b border-slate-400 p-3">
          <SignInButton mode="modal" />
        </div>
      )}
      {!!isSignedIn && (
        <div className="flex w-full justify-start border-b border-slate-400 p-3">
          <SignOutButton />
        </div>
      )}
      {!!isSignedIn && <CreatePostWizard />}
      <Feed />
    </PageLayout>
  );
};

export default Home;
