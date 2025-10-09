
import type { User, AcademicCentre } from './types';

export const INITIAL_HOST_EMAIL = 'izzuddin@ikim.gov.my';

export const INITIAL_USERS: Omit<User, 'id'>[] = [{
    name: 'Izzuddin',
    email: INITIAL_HOST_EMAIL,
    role: 'host',
    approved: true,
    organization: 'IKIM'
}];

export const INITIAL_ACADEMIC_CENTRES: Omit<AcademicCentre, 'id'>[] = [
    { name: 'Pusat Kajian Syariah, Undang-Undang Dan Politik', abbr: 'SYARAK' },
    { name: 'Pusat Kajian Ekonomi Dan Kemasyarakatan', abbr: 'EMAS' },
    { name: 'Pusat Kajian Sains Dan Alam Sekitar', abbr: 'KIAS' },
    { name: 'Pusat Kajian Akidah, Perbandingan Agama dan Keharmonian', abbr: 'APAK' },
    { name: 'Unit Pengurusan Penyelidikan', abbr: 'RMU' }
];

export const IKIM_LOGO_URL = 'https://www.ikim.gov.my/wp-content/uploads/2022/09/logo-ikim-edit-shadow-small.png';