import Picker from "@/components/Picker";

export const metadata = { title: "Search" };

export default function Search() {
  return (
    <>
      <h1>Who shared it?</h1>
      <p className="lede">Look up any film, book or song to see who shared it today and who shared it before.</p>
      <Picker mode="browse" />
    </>
  );
}
