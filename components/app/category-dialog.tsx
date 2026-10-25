"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Check, Palette } from "lucide-react";
import { createCategoryAction, updateCategoryAction } from "@/app/actions/categories";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FieldError, Input, Label } from "@/components/ui/field";
import { CategoryIcon } from "@/components/ui/category-icon";
import { useToast } from "@/components/ui/toast";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/categories";
import { cn } from "@/lib/cn";
import type { Category, TxType } from "@/lib/types";

export function CategoryDialog({
  category,
  defaultType = "expense",
  renderTrigger,
  triggerLabel = "Добавить категорию",
}: {
  category?: Category;
  defaultType?: TxType;
  renderTrigger?: (open: () => void) => ReactNode;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [type, setType] = useState<TxType>(category?.type ?? defaultType);
  const [icon, setIcon] = useState(category?.icon ?? "circle-ellipsis");
  const [color, setColor] = useState(category?.color ?? CATEGORY_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setType(category?.type ?? defaultType);
    setIcon(category?.icon ?? "circle-ellipsis");
    setColor(category?.color ?? CATEGORY_COLORS[0]);
    setError(null);
  }, [open, category, defaultType]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("type", type);
      formData.set("icon", icon);
      formData.set("color", color);
      if (category) formData.set("id", category.id);
      const result = category ? await updateCategoryAction(formData) : await createCategoryAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Не удалось сохранить категорию");
        return;
      }
      toast(result.message ?? "Категория сохранена");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Не удалось сохранить категорию. Проверьте соединение");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {renderTrigger ? (
        renderTrigger(() => setOpen(true))
      ) : (
        <Button onClick={() => setOpen(true)} size="md">
          <Palette size={15} /> {triggerLabel}
        </Button>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={category ? "Редактировать категорию" : "Новая категория"}
        description="Название, тип, иконка и цвет — всё можно изменить позже."
      >
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-surface p-1">
            {(["expense", "income"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={cn(
                  "rounded-lg py-2 text-[13px] font-medium transition-colors",
                  type === value ? "bg-white text-ink shadow-sm ring-1 ring-line" : "text-muted hover:text-ink",
                )}
              >
                {value === "expense" ? "Расход" : "Доход"}
              </button>
            ))}
          </div>

          <div>
            <Label htmlFor="category-name">Название</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например, Спорт"
              maxLength={40}
              autoFocus
              required
            />
          </div>

          <div>
            <Label>Иконка</Label>
            <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
              {CATEGORY_ICONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => setIcon(iconName)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-lg border transition-colors",
                    icon === iconName
                      ? "border-brand bg-brand-soft text-brand-strong"
                      : "border-line bg-surface-raised text-muted hover:border-line-strong hover:text-ink",
                  )}
                  aria-label={iconName}
                  aria-pressed={icon === iconName}
                >
                  <CategoryIcon name={iconName} size={16} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Цвет</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColor(value)}
                  className="flex h-7 w-7 items-center justify-center rounded-full ring-offset-2 ring-offset-[var(--mt-raised)] transition-shadow"
                  style={{
                    backgroundColor: value,
                    boxShadow: color === value ? `0 0 0 2px var(--mt-raised), 0 0 0 4px ${value}` : undefined,
                  }}
                  aria-label={`Цвет ${value}`}
                  aria-pressed={color === value}
                >
                  {color === value ? <Check size={13} className="text-white" /> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface/60 p-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${color}18`, color }}
            >
              <CategoryIcon name={icon} size={18} />
            </span>
            <div>
              <p className="text-[12px] font-medium text-ink">{name.trim() || "Название категории"}</p>
              <p className="text-[10px] text-muted">{type === "expense" ? "Категория расходов" : "Категория доходов"}</p>
            </div>
          </div>

          <FieldError>{error}</FieldError>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" loading={loading}>
              {category ? "Сохранить" : "Создать категорию"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
