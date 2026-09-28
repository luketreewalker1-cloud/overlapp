import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1>Nothing at this link.</h1>
      <p className="lede">The name or the pick may have changed.</p>
      <Link className="btn solid" href="/">Pick today's thing</Link>
    </>
  );
}
