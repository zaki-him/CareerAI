import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "@/components/shared/Header";

export default async function Home() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-up");
  }

  return (
    <div className="flex flex-col justify-center ">
      <Header />
      <hr />
      <main>
        hhhhhhhhhhhh
      </main>
    </div>
  );
}
