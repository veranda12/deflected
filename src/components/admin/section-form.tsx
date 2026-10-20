import { ActionForm, Panel, Submit, TextArea, TextField, Toggle } from "@/components/admin/form";
import { saveSection } from "@/app/admin/(panel)/konten/actions";
import { CONTENT_SECTIONS, getPath, toFieldText, type SectionKey } from "@/lib/content-schema";

/** Renders the admin form for one settings section from its descriptor. */
export function SectionForm({ sectionKey, value }: { sectionKey: SectionKey; value: unknown }) {
  const section = CONTENT_SECTIONS[sectionKey];
  if (!section) return null;
  return (
    <ActionForm action={saveSection.bind(null, sectionKey)}>
      <Panel title={section.title} description={section.description} actions={<Submit>Simpan</Submit>}>
        <div className="grid gap-5 md:grid-cols-2">
          {section.fields.map((f) => {
            const name = f.path.replace(/\./g, "__");
            const v = getPath(value, f.path);
            if (f.type === "bool") return <Toggle key={name} label={f.label} name={name} defaultChecked={!!v} hint={f.hint} />;
            if (f.type === "text")
              return <TextField key={name} label={f.label} name={name} defaultValue={toFieldText(f.type, v)} maxLength={f.max} required={f.required} hint={f.hint} />;
            const multiline = f.type !== "textarea";
            return (
              <TextArea
                key={name}
                className={multiline ? "md:col-span-2" : undefined}
                label={f.label}
                name={name}
                rows={multiline ? Math.min(12, Math.max(4, toFieldText(f.type, v).split("\n").length + 1)) : 3}
                defaultValue={toFieldText(f.type, v)}
                maxLength={f.type === "textarea" ? f.max : 8000}
                required={f.required}
                hint={f.hint}
              />
            );
          })}
        </div>
      </Panel>
    </ActionForm>
  );
}
