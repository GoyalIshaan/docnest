import * as Automerge from "@automerge/automerge";

class AutomergeDocument implements Record<string, unknown> {
  title: string = "";
  content: string = "";
  tags: string[] = [];
  [key: string]: unknown;
}

function simulateClientChange(change: Partial<AutomergeDocument>) {
  let doc = Automerge.from<AutomergeDocument>(new AutomergeDocument());
  doc = Automerge.change(doc, (d) => {
    Object.assign(d, change);
  });
  const changes = Automerge.getChanges(
    Automerge.init<AutomergeDocument>(),
    doc
  );
  const serializedChanges = changes.map((change) =>
    Array.from(new Uint8Array(change))
  );
  return { changes: serializedChanges };
}

export { AutomergeDocument, simulateClientChange };
