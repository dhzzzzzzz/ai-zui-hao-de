

## Plan: Remove Tool Count Badge from Category Headers

Remove the `<span>` element showing "X 个工具" next to each category name in the `CategorySection` component.

### Change

**File: `src/components/home/CategorySection.tsx`**
- Delete the `<span className="hidden sm:inline-flex ...">` element (around line 155) that displays `{category.tools.length} 个工具`.

This is a single-line removal with no other side effects.

