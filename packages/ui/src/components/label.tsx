import { cn } from "@meteor/ui/lib/utils";
import type * as React from "react";

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: <Shadcn UI's Label component is designed to be used with the `htmlFor` prop, which associates the label with a form control. This ensures that the label is accessible and provides a clear relationship between the label and the form control. By using the `htmlFor` prop, we can maintain accessibility while still providing a flexible and customizable label component.>
    <label
      data-slot="label"
      className={cn(
        "flex select-none items-center gap-2 text-xs leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
