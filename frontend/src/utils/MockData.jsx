import React from "react";
import {
  ShoppingBag,
  Pizza,
  Salad,
  Sandwich,
  Coffee,
  Cake,
} from "lucide-react";

// Dummy data for menu items
export const menuItems = [
  {
    id: 1,
    name: "Margherita Pizza",
    price: 12.99,
    category: "Pizza",
    image: "/api/placeholder/100/100",
  },
  {
    id: 2,
    name: "Classic Burger",
    price: 10.99,
    category: "Burgers",
    image: "/api/placeholder/100/100",
  },
  {
    id: 3,
    name: "Caesar Salad",
    price: 8.99,
    category: "Salads",
    image: "/api/placeholder/100/100",
  },
  {
    id: 4,
    name: "Latte",
    price: 4.5,
    category: "Drinks",
    image: "/api/placeholder/100/100",
  },
  {
    id: 5,
    name: "Tiramisu",
    price: 6.99,
    category: "Desserts",
    image: "/api/placeholder/100/100",
  },
  {
    id: 6,
    name: "Pasta Carbonara",
    price: 14.99,
    category: "Pasta",
    image: "/api/placeholder/100/100",
  },
  {
    id: 7,
    name: "Garlic Bread",
    price: 3.99,
    category: "Sides",
    image: "/api/placeholder/100/100",
  },
  {
    id: 8,
    name: "Iced Tea",
    price: 3.5,
    category: "Drinks",
    image: "/api/placeholder/100/100",
  },
  {
    id: 9,
    name: "Chocolate Cake",
    price: 5.99,
    category: "Desserts",
    image: "/api/placeholder/100/100",
  },
  {
    id: 10,
    name: "Hawaiian Pizza",
    price: 14.99,
    category: "Pizza",
    image: "/api/placeholder/100/100",
  },
  {
    id: 11,
    name: "Veggie Burger",
    price: 11.99,
    category: "Burgers",
    image: "/api/placeholder/100/100",
  },
  {
    id: 12,
    name: "Greek Salad",
    price: 9.99,
    category: "Salads",
    image: "/api/placeholder/100/100",
  },
];

// Categories with icons
export const categories = [
  { name: "All", icon: <ShoppingBag size={20} /> },
  { name: "Pizza", icon: <Pizza size={20} /> },
  { name: "Burgers", icon: <Sandwich size={20} /> },
  { name: "Salads", icon: <Salad size={20} /> },
  { name: "Drinks", icon: <Coffee size={20} /> },
  { name: "Desserts", icon: <Cake size={20} /> },
];