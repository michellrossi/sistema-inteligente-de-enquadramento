import VMasker from 'vanilla-masker';

export const applyCnaeMask = (value: string) => VMasker.toPattern(value, '9999-9/99');
export const applyCnpjMask = (value: string) => VMasker.toPattern(value, '99.999.999/9999-99');
export const applyCpfMask = (value: string) => VMasker.toPattern(value, '999.999.999-99');
export const applySqlMask = (value: string) => VMasker.toPattern(value, '999.999.9999-9');
