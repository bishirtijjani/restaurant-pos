import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../features/common/headerSlice";
import MenuItems from "../../features/menuItems";

function InternalPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Menu Items" }));
  }, []);

  return <MenuItems />;
}

export default InternalPage;
