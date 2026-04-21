import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "@/components/shared/Header";
import CareerAIComponent from "@/components/shared/CareerAIComponent";
import OnBoarding from "@/components/shared/OnBoarding";

export default async function Home() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-up");
  }

  return (
    <div className="flex flex-col justify-center ">
      <Header />
      <hr />
      <main className="px-10 py-5">
        <CareerAIComponent />
        <div className="flex mt-10">
          <OnBoarding />
        </div>
      </main>
    </div>
  );
}
