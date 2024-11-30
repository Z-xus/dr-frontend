import React from "react";


function DashboardPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  return (
    <div className="">

      <h2 className="my-5 font-bold text-center text-2xl text-neutral-800 dark:text-neutral-200">
        Welcome to Genesis DeFi 🚀
      </h2>

    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white dark:from-neutral">
        Welcome
      </div>
    </>
  );
};

export default DashboardPage;
