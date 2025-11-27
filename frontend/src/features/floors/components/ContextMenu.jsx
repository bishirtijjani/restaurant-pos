import React from "react";
import { Menu, Item, Separator, Submenu } from "react-contexify";
import "react-contexify/dist/ReactContexify.css";
import {
  UserPlus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Combine,
  Split,
} from "lucide-react";

const MENU_ID = "table_context_menu";

const ContextMenu = ({ onAction }) => {
  const handleItemClick = ({ id, props }) => {
    onAction(id, props.table);
  };

  return (
    <Menu id={MENU_ID} animation="fade">
      <Item id="open" onClick={handleItemClick}>
        <Edit className="w-4 h-4 mr-2" />
        Open / Details
      </Item>
      <Separator />
      <Submenu label="Status">
        <Item id="status_available" onClick={handleItemClick}>
          <CheckCircle className="w-4 h-4 mr-2 text-success" />
          Mark Available
        </Item>
        <Item id="status_occupied" onClick={handleItemClick}>
          <UserPlus className="w-4 h-4 mr-2 text-primary" />
          Mark Occupied
        </Item>
        <Item id="status_dirty" onClick={handleItemClick}>
          <XCircle className="w-4 h-4 mr-2 text-error" />
          Mark Dirty
        </Item>
      </Submenu>
      <Separator />
      <Item id="assign_waiter" onClick={handleItemClick}>
        <UserPlus className="w-4 h-4 mr-2" />
        Assign Waiter
      </Item>
      <Item id="merge" onClick={handleItemClick}>
        <Combine className="w-4 h-4 mr-2" />
        Merge Tables
      </Item>
      <Item id="split" onClick={handleItemClick}>
        <Split className="w-4 h-4 mr-2" />
        Split Table
      </Item>
      <Separator />
      <Item id="delete" onClick={handleItemClick} className="text-error">
        <Trash2 className="w-4 h-4 mr-2" />
        Delete Table
      </Item>
    </Menu>
  );
};

export default ContextMenu;
export { MENU_ID };
