import { Link } from "@tanstack/react-router";

export type BlogPost = {
  id: string;
  image: string;
  title: string;
  excerpt?: string;
  date: string;
  readTime: string;
  resume: string;
  url: string;
};

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <div
      key={post.id}
      className="rounded-md overflow-hidden bg-surface-card py-5"
    >
      <div className="relative w-full max-w-[268px] aspect-[268/195] overflow-hidden rounded-3xl mx-auto">
        <img
          src={post.image}
          alt="Card de notícia"
          className="size-full object-cover"
          width={268}
          height={195}
        />
      </div>
      <div className="py-3 px-4 space-y-2">
        <div className="text-secondary text-xs font-medium flex items-start justify-center lg:justify-between gap-x-2">
          <p className="text-nowrap">{post.date}</p>
          <span>|</span>
          <p>{post.readTime}</p>
        </div>
        <h3 className="text-base font-bold text-foreground">{post.title}</h3>
        <p className="text-secondary text-xs font-medium">{post.resume}</p>
        <Link to={post.url} className="text-accent text-xs font-bold">
          Ler mais →
        </Link>
      </div>
    </div>
  );
}
