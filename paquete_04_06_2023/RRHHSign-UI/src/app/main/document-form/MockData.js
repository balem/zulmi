export const mockEmployees = [
    { id: 0, ci: '653656', name: 'Jose Perez', hireDate: new Date(2018, 5, 20), fromDate: new Date(2019, 7, 13), toDate: new Date(2019, 7, 22), salario: 2000000, departamento: 1, motivoAusencia: 'Consulta médica marcada', tiposPermiso: {2: true} },
    { id: 1, ci: '4212366', name: 'Magno Oliveira', hireDate: new Date(2018, 2, 14), fromDate: new Date(2019, 6, 30), toDate: new Date(2019, 11, 31), salario: 2300000, departamento: 2, motivoAusencia: 'Consulta médica marcada', tiposPermiso: {1: true} },
    { id: 2, ci: '5335442', name: 'Mauricio Ruíz Díaz', hireDate: new Date(2015, 1, 10), fromDate: new Date(2019, 6, 30), toDate: new Date(2019, 7, 31), salario: 10000000, departamento: 3, motivoAusencia: 'Consulta médica marcada', tiposPermiso: {3: true} },
    { id: 3, ci: '3452652', name: 'Pedro Melgarejo', hireDate: new Date(2014, 7, 17), fromDate: new Date(2019, 7, 13), toDate: new Date(2019, 7, 20), salario: 5000000, departamento: 4, motivoAusencia: 'Consulta médica marcada', tiposPermiso: {4: true} },
    { id: 4, ci: '2456332', name: 'Maria Ochoa', hireDate: new Date(2019, 2, 12), fromDate: new Date(2019, 7, 13), toDate: new Date(2019, 7, 22), salario: 3000000, departamento: 3, motivoAusencia: 'Consulta médica marcada', tiposPermiso: {2: true} },
    { id: 5, ci: '1882722', name: 'Laura Caceres', hireDate: new Date(2017, 3, 16), fromDate: new Date(2019, 7, 13), toDate: new Date(2019, 7, 23), salario: 8000000, departamento: 4, motivoAusencia: 'Consulta médica marcada', tiposPermiso: {5: true} },
    { id: 6, ci: '88344', name: 'Anibal Santa Cruz', hireDate: new Date(2018, 4, 5), fromDate: new Date(2019, 7, 13), toDate: new Date(2019, 7, 29), salario: 12000000, departamento: 3, motivoAusencia: 'Consulta médica marcada', tiposPermiso: {2: true} },
    { id: 7, ci: '1223445', name: 'Gabriela Paez', hireDate: new Date(2014, 1, 11), fromDate: new Date(2019, 7, 13), toDate: new Date(2019, 7, 27), salario: 2900000, departamento: 2, motivoAusencia: 'Consulta médica marcada', tiposPermiso: {4: true} },
    { id: 8, ci: '2334123', name: 'Manuel Gonzalez', hireDate: new Date(2010, 10, 18), fromDate: new Date(2019, 7, 13), toDate: new Date(2019, 7, 28), salario: 3100000, departamento: 1, motivoAusencia: 'Consulta médica marcada', tiposPermiso: {3: true} },
]

export const mockDepartamentos = [
    { id: 1, name: 'Auxiliar Administrativo' },
    { id: 2, name: 'Administración y Recursos Humanos' },
    { id: 3, name: 'Finanzas y Contabilidad' },
    { id: 4, name: 'Publicidad y Mercadotecnia' },
    { id: 5, name: 'Informática' },
]

export const mockTiposPermiso = [
    { id: 1, name: 'Enfermedad' },
    { id: 2, name: 'Vacaciones' },
    { id: 3, name: 'Defunción' },
    { id: 4, name: 'Maternidad/Paternidad' },
    { id: 5, name: 'Tiempo libre no remunerado' },
    { id: 6, name: 'Otros' },
]