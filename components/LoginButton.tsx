import { auth, signIn, signOut } from "@/lib/auth";

export async function LoginButton() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-100 shadow-sm">
        <span className="text-sm font-medium text-gray-700">
          Hola, {session.user.name?.split(' ')[0]}
        </span>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button
            type="submit"
            className="bg-[#1A1C1C] text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#FF97A4] transition-all"
          >
            Salir
          </button>
        </form>
      </div>
    );
  }

  return (
    <form
      action={async () => {
        "use server";
        await signIn("google");
      }}
    >
      <button
        type="submit"
        className="bg-white text-[#FF97A4] border-2 border-[#FF97A4] px-6 py-2 rounded-full font-bold hover:bg-[#FF97A4] hover:text-white transition-all shadow-md"
      >
        Iniciar Sesión
      </button>
    </form>
  );
}

