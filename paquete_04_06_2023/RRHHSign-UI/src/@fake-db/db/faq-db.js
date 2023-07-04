import mock from './../mock';

const faqDB = [
    {
        'id'      : '1',
        'question': '¿Cuáles son los requisitos para adquirir mi certificado digital?',
        'answer'  : 'Ser mayor de edad, presentar la cédula de identidad así como otro documento oficial en estado vigente. Los extranjeros residentes deben contar con cédula paraguaya vigente.'
    },
    {
        'id'      : '2',
        'question': '¿Cómo funciona la firma digital?',
        'answer'  : 'La firma digital resulta de la aplicación de un algoritmo matemático llamado función hash, al contenido de un documento. A este resultado luego se le aplica un algoritmo de firma (con una clave privada) y ello genera la firma digital como producto. (Para más información diríjase a la pestaña de cómo funciona).'
    },
    {
        'id'      : '3',
        'question': '¿Qué es un certificado digital?',
        'answer'  : 'Es un mecanismo electrónico o digital que permite garantizar, confirmar o validar: a. Vinculación entre documento-firma digital y persona. b. Integridad, autenticidad y no alteración de un documento y la firma digital asociada. c. Autenticación o certificación del documento y la firma asociada (potestades públicas certificadoras)'
    }
];

mock.onGet('/api/faq').reply((config) => {
    return [200, faqDB];
});
