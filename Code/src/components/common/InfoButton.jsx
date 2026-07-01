import infoIcon from "../../../Assets/InfoButtonIcon.png";

function InfoButton({ label, description }) {
  return (
    <span className="relative inline-flex group">
      <button
        type="button"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white hover:bg-slate-50"
        aria-label={label}
        title={description}
      >
        <img className="h-4 w-4" src={infoIcon} alt="" />
      </button>

      <span className="pointer-events-none absolute right-0 top-8 z-20 hidden w-64 rounded-xl border border-slate-200 bg-white p-3 text-left text-xs font-normal leading-relaxed text-slate-600 shadow-lg group-hover:block">
        {description}
      </span>
    </span>
  );
}

export default InfoButton;

/*
BEGINNER DOCUMENTATION:

1. Why make an InfoButton component?
A component lets us reuse the same small info icon beside many headings or labels.

2. What is title?
title shows a simple browser tooltip when the user hovers over the button.

3. What is group-hover?
Tailwind's group-hover lets a child element appear when the parent group is hovered.

4. Why is the img alt empty?
The button already has aria-label text for screen readers, so the image is decorative.
*/
