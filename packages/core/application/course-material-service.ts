import type {
  CourseMaterial,
  CourseMaterialSnapshotDto,
  CourseMaterialType,
  ImportCourseMaterialInput,
} from '@uniforge/contracts/course/index.js';
import type { Id } from '@uniforge/contracts/domain/primitives.js';
export interface ManagedMaterialCopy {
  readonly originalFileName: string;
  readonly originalPath: string;
  readonly managedCopyPath: string;
  readonly contentHash: string;
}
export type MaterialCopy = (sourcePath: string) => Promise<ManagedMaterialCopy>;
export class CourseMaterialService {
  private readonly materials: CourseMaterial[] = [];
  public constructor(private readonly copy: MaterialCopy) {}
  async importMaterial(input: ImportCourseMaterialInput): Promise<CourseMaterialSnapshotDto> {
    if (!input.context.permissions.includes('course:write')) throw new Error('PERMISSION_DENIED');
    if (!input.sourcePath.trim() || !input.courseId || !input.commandId)
      throw new Error('INVALID_INPUT');
    const copied = await this.copy(input.sourcePath);
    const material: CourseMaterial = {
      id: `course-material-${input.commandId}` as CourseMaterial['id'],
      courseId: input.courseId,
      originalFileName: copied.originalFileName,
      originalPath: copied.originalPath,
      managedCopyPath: copied.managedCopyPath,
      contentHash: copied.contentHash,
      detectedType: detectType(copied.originalFileName),
      parserVersion: 'none@1',
      extractedRanges: [],
      citations: [],
      importedAt: new Date().toISOString() as CourseMaterial['importedAt'],
    };
    this.materials.push(material);
    return {
      courseId: input.courseId,
      materials: this.materialsFor(input.courseId),
      imported: material,
    };
  }
  async getSnapshot(courseId: Id<'course'>): Promise<CourseMaterialSnapshotDto> {
    return { courseId, materials: this.materialsFor(courseId) };
  }
  private materialsFor(courseId: Id<'course'>): readonly CourseMaterial[] {
    return this.materials.filter((material) => material.courseId === courseId);
  }
}
const detectType = (fileName: string): CourseMaterialType => {
  const extension = fileName.toLowerCase().split('.').pop();
  if (extension === 'pdf') return 'PDF';
  if (extension === 'docx' || extension === 'doc') return 'DOCX';
  if (extension === 'pptx' || extension === 'ppt') return 'PPTX';
  if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') return 'XLSX';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension ?? '')) return 'IMAGE';
  if (['txt', 'md', 'markdown'].includes(extension ?? '')) return 'TEXT';
  return 'UNKNOWN';
};
