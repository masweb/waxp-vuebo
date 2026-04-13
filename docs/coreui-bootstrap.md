# CoreUI + Bootstrap conventions

## When to use each framework

- **Bootstrap components**: Use directly when the component has no logic
  - Examples: Buttons, Cards, Inputs...
- **CoreUI components**: Use when the component has logic
  - Examples: Dropdowns, Modals...

## CSS rules

- **Never write custom CSS for something Bootstrap already covers**:
  - Buttons: `btn btn-sm btn-secondary/btn-outline-secondary`
  - Groups: `btn-group btn-group-sm`
  - Layout: `d-flex gap-2 align-items-center`
  - Spacing: `px-3 py-2`
  - etc...
- **Only add custom SCSS for things Bootstrap genuinely cannot express**:
  - Preview zone backgrounds
  - Wheel-specific input behavior
