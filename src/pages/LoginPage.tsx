import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { IconBrandGoogle } from "@tabler/icons-react";

function LoginPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const isTestCredentials =
        formData.email === "test@test.com" &&
        formData.password === "test123";

      if (isTestCredentials) {
        window.location.href = "/dashboard";
      }

      const username = isTestCredentials ? "test" : formData.email;

      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);

      // Show success message
      setSuccess("Login successful! Token stored in localStorage.");

      // Clear form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page bg-white dark:bg-black h-screen grid place-items-center">
      <div className="max-w-md w-full border rounded-none md:rounded-2xl p-4 md:p-8 bg-white dark:bg-black">
        <h2 className="font-bold text-center text-2xl text-neutral-800 dark:text-neutral-200">
          Login to Genesis DeFi 🚀
        </h2>
        <p className="text-center text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
          Login to Genesis because we are the best in the world.
        </p>
        {error && (
          <div className="my-4 p-2 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="my-4 p-2 text-sm text-green-500 bg-green-100 dark:bg-green-900/30 rounded">
            {success}
          </div>
        )}
        <form className="my-8" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
            <LabelInputContainer>
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                placeholder="Tyler"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                placeholder="Durden"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
              />
            </LabelInputContainer>
          </div>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="test@test.com"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="test123"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </LabelInputContainer>
          <button
            className={cn(
              "bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]",
              loading && "opacity-50 cursor-not-allowed"
            )}
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"} &rarr;
            <BottomGradient />
          </button>

          <hr className="h-px w-2/5 mx-auto my-8 bg-gray-200 border-0 dark:bg-gray-700" />

          <div className="flex flex-col space-y-4">
            <button
              className="relative group/btn flex space-x-2 items-center justify-start px-4 w-full text-black rounded-md h-10 font-medium shadow-input bg-gray-50 dark:bg-zinc-900 dark:shadow-[0px_0px_1px_1px_var(--neutral-800)]"
              type="button"
              onClick={() => {/* Handle Google login */ }}
            >
              <IconBrandGoogle className="h-4 w-4 text-neutral-800 dark:text-neutral-300" />
              <span className="text-neutral-700 dark:text-neutral-300 text-sm">
                Google
              </span>
              <BottomGradient />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default LoginPage;
