import InlineChat from "./InlineChat";
import SummaryCard from "./SummaryCard";

const SideBar = () => {
  return (
    <div className="w-1/4 p-4 bg-white shadow-md overflow-y-auto">
      <SummaryCard />
      <div className="h-0.5 bg-slate-200 my-3 rounded-full w-full" />
      <InlineChat />
    </div>
  );
};

export default SideBar;
