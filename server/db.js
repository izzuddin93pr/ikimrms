const bcrypt = require('bcryptjs');

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

// Initial Data
const INITIAL_HOST_EMAIL = 'izzuddin@ikim.gov.my';
const salt = bcrypt.genSaltSync(10);
// Default password is "password" for the initial host user
const hostPasswordHash = bcrypt.hashSync('password', salt);

let users = [
    {
        id: generateId(),
        name: 'Izzuddin',
        email: INITIAL_HOST_EMAIL,
        password: hostPasswordHash,
        role: 'host',
        approved: true,
        organization: 'IKIM'
    }
];

let academicCentres = [
    { id: generateId(), name: 'Pusat Kajian Syariah, Undang-Undang Dan Politik', abbr: 'SYARAK' },
    { id: generateId(), name: 'Pusat Kajian Ekonomi Dan Kemasyarakatan', abbr: 'EMAS' },
    { id: generateId(), name: 'Pusat Kajian Sains Dan Alam Sekitar', abbr: 'KIAS' },
    { id: generateId(), name: 'Pusat Kajian Akidah, Perbandingan Agama dan Keharmonian', abbr: 'APAK' },
    { id: generateId(), name: 'Unit Pengurusan Penyelidikan', abbr: 'RMU' }
];

let research = [];
let collaborations = [];
let researchers = [];

// Collections mapping
const collections = {
    users,
    academicCentres,
    research,
    collaborations,
    researchers
};

// Generic DB functions
const findAll = (collectionName) => {
    return collections[collectionName] || [];
};

const findById = (collectionName, id) => {
    return collections[collectionName]?.find(item => item.id === id);
};

const findBy = (collectionName, field, value) => {
    return collections[collectionName]?.find(item => item[field] === value);
};

const insert = (collectionName, item) => {
    const newItem = { ...item, id: generateId() };
    collections[collectionName]?.push(newItem);
    return newItem;
};

const update = (collectionName, id, updatedFields) => {
    const collection = collections[collectionName];
    if (!collection) return null;
    const index = collection.findIndex(item => item.id === id);
    if (index === -1) return null;
    collection[index] = { ...collection[index], ...updatedFields };
    return collection[index];
};

const remove = (collectionName, id) => {
    const collection = collections[collectionName];
    if (!collection) return false;
    const initialLength = collection.length;
    collections[collectionName] = collection.filter(item => item.id !== id);
    return collections[collectionName].length < initialLength;
};

module.exports = {
    findAll,
    findById,
    findBy,
    insert,
    update,
    remove,
    generateId,
};
