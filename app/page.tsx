import { Button } from "@/components/ui/button";



export default async function Home() {
 

  return (
    <section className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-bold">NextJS 16 Boilerplate</h1>
      <h2 className="text-2xl font-bold">This is a NextJS 16 Boilerplate application</h2>
      <div className="flex gap-4">
        <Button>Default Button</Button>
      </div>
    </section>
  );
}
