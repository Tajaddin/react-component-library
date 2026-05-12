import { useState } from "react";
import ReactDOM from "react-dom/client";
import {
  DataTable,
  Dropdown,
  FormBuilder,
  Modal,
  Pagination,
  Tabs,
  ToastProvider,
  useToast,
  type FieldDef,
} from "./index";

interface Row extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

const ROWS: Row[] = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  active: i % 3 !== 0,
}));

const FIELDS: FieldDef<{ name: string; email: string; role: string; about: string; agree: boolean }>[] = [
  { kind: "text", name: "name", label: "Name", required: true },
  { kind: "text", name: "email", label: "Email", type: "email", required: true },
  {
    kind: "select",
    name: "role",
    label: "Role",
    required: true,
    options: [
      { value: "user", label: "User" },
      { value: "admin", label: "Admin" },
    ],
  },
  { kind: "textarea", name: "about", label: "Bio" },
  { kind: "checkbox", name: "agree", label: "I agree to the terms" },
];

function DemoApp() {
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const t = useToast();
  const pageSize = 10;
  const filtered =
    filter === "active"
      ? ROWS.filter((r) => r.active)
      : filter === "inactive"
      ? ROWS.filter((r) => !r.active)
      : ROWS;
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <div style={{ maxWidth: 880, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>@tajaddin/react-components</h1>
      <p>Seven components, zero peer deps beyond React, accessibility tested.</p>

      <Tabs
        tabs={[
          {
            id: "table",
            label: "DataTable + Pagination",
            content: (
              <>
                <div style={{ display: "flex", gap: "1rem", alignItems: "end", marginBottom: "0.75rem" }}>
                  <Dropdown
                    label="Filter"
                    value={filter}
                    onChange={(v) => { setFilter(v); setPage(1); }}
                    options={[
                      { value: "all", label: "All users" },
                      { value: "active", label: "Active only" },
                      { value: "inactive", label: "Inactive only" },
                    ]}
                  />
                  <button onClick={() => t.show("Hello from a toast!", "success")}>
                    Trigger toast
                  </button>
                  <button onClick={() => setOpen(true)}>Open modal</button>
                </div>
                <DataTable
                  data={pageRows}
                  columns={[
                    { key: "id", header: "ID", width: 60 },
                    { key: "name", header: "Name" },
                    { key: "email", header: "Email" },
                    {
                      key: "active",
                      header: "Status",
                      render: (r) => (r.active ? "Active" : "Inactive"),
                    },
                  ]}
                  onRowClick={(r) => t.show(`Clicked ${r.name}`, "info")}
                />
                <div style={{ marginTop: "0.75rem" }}>
                  <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
                </div>
              </>
            ),
          },
          {
            id: "form",
            label: "FormBuilder",
            content: (
              <FormBuilder
                fields={FIELDS}
                onSubmit={(v) => { t.show(`Saved: ${JSON.stringify(v)}`, "success", 5000); }}
              />
            ),
          },
        ]}
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Confirm" footer={
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button onClick={() => setOpen(false)}>Cancel</button>
          <button onClick={() => { t.show("Confirmed.", "success"); setOpen(false); }}>
            Confirm
          </button>
        </div>
      }>
        <p>Press Escape, click outside, or use the buttons below.</p>
      </Modal>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <ToastProvider>
    <DemoApp />
  </ToastProvider>,
);
