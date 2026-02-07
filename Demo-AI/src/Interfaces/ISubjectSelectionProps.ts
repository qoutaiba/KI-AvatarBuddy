import { Subject } from '../../src/classes/Subject'

export interface ISubjectSelectionProps {
  username: string;
  subjects: Subject[] | null;
}