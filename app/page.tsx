import EncryptionTool from "@/component/EncryptionTool";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-items-center  gap-4 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      
        <EncryptionTool />
     
    </div>
  );
}
