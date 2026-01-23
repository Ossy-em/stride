import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function getCurrentUser() {
  const session = await auth();
  
  if (!session || !session.user) {
    return null;
  }
  
  return {
    id: session.user.id!,
    email: session.user.email!,
    name: session.user.name,
    image: session.user.image,
  };
}