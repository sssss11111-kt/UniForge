import path from 'node:path';
export const workspaceLayout = (root: string) => {
  const r = path.resolve(root);
  return {
    root: r,
    managed: path.join(r, 'managed'),
    trash: path.join(r, 'trash'),
    staging: path.join(r, 'staging'),
  };
};
