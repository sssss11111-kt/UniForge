# Stage 5 protected-path policy

Project Practice may operate only on an explicitly authorized user project workspace. The UniForge source tree, installed application, updater, migrations, permission/security kernel, and build/signing infrastructure are protected paths. Traversal, canonical-path mismatch, symlink/junction escape, and unrelated workspace access must fail closed; approval cannot bypass these boundaries.
