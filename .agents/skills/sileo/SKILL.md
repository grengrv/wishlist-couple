---
name: sileo
description: Use this skill whenever the user wants to add toast notifications, alerts, or any kind of popup feedback messages to a React app using the Sileo library. Trigger when the user mentions "toast", "notification", "sileo", "alert popup", "success message", "error message", "loading toast", or wants to show feedback after an action (form submit, API call, delete, save, etc.). Also trigger when the user asks how to install or configure Sileo, or wants to customize toast appearance (dark mode, custom colors, icons, position).
---

# Sileo Toast Skill

Sileo is a React toast library using gooey SVG morphing + spring physics. Beautiful by default, minimal config needed.

## Installation

```bash
npm install sileo
```

## Quick Setup

Add `<Toaster>` once at the app root:

```tsx
import { sileo, Toaster } from "sileo";

export default function App() {
  return (
    <>
      <Toaster position="top-right" />
      <YourApp />
    </>
  );
}
```

## Firing Toasts

```ts
import { sileo } from "sileo";

sileo.success({ title: "Saved!" });
sileo.error({ title: "Something went wrong" });
sileo.warning({ title: "Low storage" });
sileo.info({ title: "Update available" });

// With description
sileo.success({
  title: "Uploaded",
  description: "Your file has been saved.",
});

// Sticky (no auto-dismiss)
sileo.error({ title: "Critical error", duration: null });
```

## Promise Toast (loading → success/error)

```ts
sileo.promise(uploadFile(data), {
  loading: { title: "Uploading..." },
  success: (res) => ({ title: `Done! ${res.filename} saved.` }),
  error: (err) => ({ title: "Upload failed", description: err.message }),
});
```

`sileo.promise()` returns the original promise so you can chain `.then()`.

## Action Toast (with button)

```ts
sileo.action({
  title: "Item deleted",
  description: "This action cannot be undone.",
  button: {
    title: "Undo",
    onClick: () => restoreItem(),
  },
});
```

## Positions

```ts
// Set default on Toaster
<Toaster position="bottom-center" />

// Override per toast
sileo.success({ title: "Saved", position: "bottom-right" });
```

Available: `top-left` `top-center` `top-right` `bottom-left` `bottom-center` `bottom-right`

## Dismiss / Clear

```ts
const id = sileo.success({ title: "Hello" });
sileo.dismiss(id);      // dismiss specific
sileo.clear();          // clear all
sileo.clear("top-right"); // clear by position
```

## Dark Theme

```tsx
// Per toast
sileo.success({
  title: "Saved",
  fill: "#171717",
  styles: {
    title: "text-white!",
    description: "text-white/75!",
    badge: "bg-white/20!",
    button: "bg-white/10!",
  },
});

// Global dark theme via Toaster
<Toaster
  options={{
    fill: "#171717",
    styles: {
      title: "text-white!",
      description: "text-white/75!",
      badge: "bg-white/10!",
      button: "bg-white/10! hover:bg-white/15!",
    },
  }}
/>

// Auto light/dark based on OS
<Toaster theme="system" />
```

## Custom Icon & JSX Description

```tsx
sileo.info({
  title: "New message",
  icon: <BellIcon className="w-4 h-4" />,
  description: (
    <div className="flex gap-2">
      <Avatar src={user.avatar} />
      <span>{user.name} sent you a message</span>
    </div>
  ),
});
```

## CSS Variables (global color override)

```css
:root {
  --sileo-state-success: oklch(0.723 0.219 142.136);
  --sileo-state-error: oklch(0.637 0.237 25.331);
  --sileo-state-warning: oklch(0.795 0.184 86.047);
  --sileo-state-info: oklch(0.685 0.169 237.323);
  --sileo-state-loading: oklch(0.556 0 0);
  --sileo-state-action: oklch(0.623 0.214 259.815);
  --sileo-width: 350px;
  --sileo-height: 40px;
  --sileo-duration: 600ms;
}
```

## SileoOptions (full API)

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | string | — | Toast heading |
| `description` | ReactNode | — | Body, supports JSX |
| `position` | SileoPosition | Toaster default | Override position |
| `duration` | number \| null | 6000 | Auto-dismiss ms. `null` = sticky |
| `icon` | ReactNode \| null | State icon | Custom icon |
| `fill` | string | `"#FFFFFF"` | SVG background color |
| `styles` | SileoStyles | — | Class overrides |
| `roundness` | number | 16 | Border radius px |
| `autopilot` | boolean \| object | true | Auto expand/collapse |
| `button` | SileoButton | — | Action button |

## Toaster Props

| Prop | Type | Default |
|---|---|---|
| `position` | SileoPosition | `"top-right"` |
| `offset` | number \| string \| object | — |
| `options` | Partial\<SileoOptions\> | — |
| `theme` | `"light"` \| `"dark"` \| `"system"` | — |

## Notes

- `styles` keys use Tailwind with `!` modifier for specificity: `"text-white!"`
- Higher `roundness` = more expensive SVG blur — keep at 16 for best perf
- `autopilot: false` disables auto expand/collapse (hover to expand manually)
- All shortcut methods return `toast id` as string except `promise` (returns original promise) and `dismiss`/`clear` (return void)
