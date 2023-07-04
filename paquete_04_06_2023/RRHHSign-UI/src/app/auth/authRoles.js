/**
 * Authorization Roles
 */
const authRoles = {
    master      : ['master'],
    rh          : ['master', 'rh'],
    director    : ['master', 'director'],
    funcionario : ['master', 'funcionario'],
    onlyGuest: []
};

export default authRoles;
