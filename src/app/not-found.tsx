import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-serif text-[8rem] leading-none text-gold">404</p>
      <h1 className="mt-4 font-serif text-3xl font-light">This Page Doesn&apos;t Exist</h1>
      <p className="mt-3 max-w-sm text-muted">
        The piece you&apos;re looking for may have sold out or moved to the archive.
      </p>
      <Link href="/" className="btn-gold mt-8">
        Return Home
      </Link>
    </div>
  );
}
