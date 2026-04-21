import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "@/components/shared/Header";
import CareerAIComponent from "@/components/shared/CareerAIComponent";
import OnBoarding from "@/components/shared/OnBoarding";
import ZakChat from "@/components/shared/ZakChat";

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
        <div className="flex flex-col-reverse lg:flex-row gap-6 mt-10 items-stretch">
          <div className="flex-1 w-full h-full">
            <OnBoarding />
          </div>
          <div className="w-full lg:w-[400px] h-full">
            <ZakChat />
          </div>
        </div>
      </main>
    </div>
  );
}
