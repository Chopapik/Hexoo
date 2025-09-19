import React from "react";

export type Post = {
  id: string | number;
  userName: string;
  date: string;
  device: string;
  body: string;
};

export const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <div
      data-hasimage="true"
      data-hastext="true"
      data-size="Compact"
      className="w-full max-w-[920px] p-3 bg-primary-neutral-background-default rounded-[10px] border-t-2 border-primary-neutral-stroke-default inline-flex flex-col justify-start items-start gap-5 overflow-hidden"
    >
      <div
        data-size="Compact"
        className="w-72 inline-flex justify-start items-center gap-2"
      >
        <img
          className="size-10 rounded-[10px] border border-neutral-800"
          src="https://placehold.co/40x40"
        />
        <div className="self-stretch inline-flex flex-col justify-center items-start">
          <div className="justify-start text-text-main text-sm font-medium font-['Roboto']">
            {post.userName}
          </div>
          <div className="size- inline-flex justify-center items-center gap-1">
            <div className="justify-start text-text-neutral text-xs font-normal font-['Roboto']">
              {post.date}
            </div>
            <div className="size-1 bg-text-neutral rounded-full" />
            <div className="justify-start text-text-neutral text-xs font-normal font-['Roboto']">
              {post.device}
            </div>
          </div>
        </div>
      </div>
      <div
        data-size="Compact"
        className="self-stretch flex flex-col justify-center items-center gap-2.5 overflow-hidden"
      >
        <div className="self-stretch justify-start text-text-main text-sm font-normal font-['Roboto']">
          {post.body}
        </div>
      </div>
      <div className="self-stretch inline-flex justify-center items-start overflow-hidden">
        <img
          className="w-[500px] h-96 max-w-[500px] min-w-72 max-h-96 min-h-64 relative rounded-xl"
          src="https://placehold.co/500x426"
        />
      </div>
      <div
        data-property-1="Default"
        className="w-24 px-2 bg-white/0 inline-flex justify-start items-start gap-2 overflow-hidden"
      >
        <div
          data-animseq="1"
          data-status="Unliked"
          className="size- flex justify-start items-center gap-2"
        >
          <div className="size-6 relative overflow-hidden">
            <div className="size-5 left-[2px] top-[3px] absolute bg-text-neutral" />
          </div>
          <div className="justify-start text-text-neutral text-base font-semibold font-['Albert_Sans']">
            1
          </div>
        </div>
        <div
          data-theme="Dark"
          className="h-6 flex justify-start items-center gap-2"
        >
          <div className="size-6 relative overflow-hidden">
            <div className="size-4 left-[3px] top-[3px] absolute outline outline-[2.50px] outline-offset-[-1.25px] outline-text-neutral" />
          </div>
          <div className="justify-start text-text-neutral text-base font-semibold font-['Albert_Sans']">
            1
          </div>
        </div>
      </div>
    </div>

    // <article className="w-full rounded-xl border-t border-primary-neutral-stroke-default bg-primary-neutral-background-default p-4">
    //   <header className="flex items-start gap-3">
    //     <div className="shrink-0 size-10 rounded-full bg-text-neutral/20 inline-flex items-center justify-center">
    //       <span className="text-text-neutral text-xl">@</span>
    //     </div>
    //     <div className="flex flex-col">
    //       <div className="text-text-neutral font-semibold">{post.user}</div>
    //       <div className="text-text-neutral/60 text-xs">
    //         {post.date} • Upload from {post.device}
    //       </div>
    //     </div>
    //   </header>
    //   <p className="mt-4 text-text-neutral leading-relaxed">
    //     {post.body}
    //   </p>
    // </article>
  );
};
