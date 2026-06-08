"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    await signIn("credentials", {
      email,
      password,
      callbackUrl: "/",
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow"
      >
        <h1 className="mb-6 text-2xl font-bold">
          Login
        </h1>

        <input
          className="mb-3 w-full rounded border p-2"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          className="mb-4 w-full rounded border p-2"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          className="w-full rounded bg-black p-2 text-white"
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}