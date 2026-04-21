import { Show, UserButton } from "@clerk/nextjs";

const Header = () => {
  return (
    <header className="py-3 px-8">
      <Show when="signed-in">
        <div className="flex justify-end">
          <UserButton />
        </div>
      </Show>
    </header>
  );
};

export default Header;
