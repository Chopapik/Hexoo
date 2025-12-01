import Link from "next/link";
import type { Post } from "../types/post.type";
import { isAsciiArt } from "../utils/asciiDetector";
import { useMemo } from "react";

type PostBodyProps = {
  post: Post;
};

export const PostBody = ({ post }: PostBodyProps) => {
  // Memoizujemy wynik, aby nie przeliczać go przy każdym renderze rodzica
  const isAscii = useMemo(() => isAsciiArt(post.text), [post.text]);

  return (
    <>
      <div className="self-stretch inline-flex flex-col justify-center items-center gap-4 overflow-hidden w-full">
        <div
          className={`self-stretch justify-start text-text-main text-base font-normal w-full ${
            isAscii
              ? "ascii-art" // Klasa z globals.css (monospace, whitespace: pre, overflow-x: auto)
              : "font-Albert_Sans whitespace-pre-wrap break-words" // Zwykły tekst (zachowuje entery, zawija słowa)
          }`}
        >
          {post.text}
        </div>

        {post.imageUrl && (
          <img
            className="w-full relative rounded-xl object-cover"
            src={post.imageUrl}
            alt="Post content"
          />
        )}
      </div>
    </>
  );
};
