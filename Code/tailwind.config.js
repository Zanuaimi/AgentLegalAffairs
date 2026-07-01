/** @type {import('tailwindcss').Config} */
export default {
  // Dark mode will be controlled by adding/removing the "dark" class on the <html> tag.
  darkMode: "class",

  // These paths tell Tailwind where to look for class names.
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

/*
BEGINNER DOCUMENTATION:

1. What is Tailwind CSS?
Tailwind is a CSS framework. Instead of writing custom CSS for every design, we use small utility classes.

2. What does content mean?
Tailwind scans these files and keeps only the CSS classes that are actually used.

3. What is a utility class?
A class like bg-white, p-4, rounded-xl, or text-blue-600 changes one small part of the design.

4. What is darkMode: 'class'?
It means dark mode turns on when JavaScript adds the class name "dark" to the <html> element.
*/
