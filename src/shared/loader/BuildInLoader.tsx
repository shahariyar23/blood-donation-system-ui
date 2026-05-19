import { LifeLine } from "react-loading-indicators";

const BuildInLoader = () => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <LifeLine color="red" size="large" text="Loading..." textColor="red" />
    </div>
  );
};

export default BuildInLoader;
