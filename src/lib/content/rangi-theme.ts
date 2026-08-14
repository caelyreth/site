import type { RangiTheme } from 'comark/plugins/rangi'

// Eclat Nocturne syntax colors mapped to Rangi's compact token vocabulary.
export const eclat_nocturne: RangiTheme = {
  name: 'eclat-nocturne',
  scheme: 'dark',
  bg: '#191919',
  fg: '#C0BEAF',
  numbers: '#525251',
  tokens: {
    kwd: '#DA7C7E',
    section: '#3B9174',
    class: '#D1A075',
    cmnt: '#525251',
    bracket: '#8F8F8A',
    num: '#D1A075',
    bool: '#CE94A7',
    str: '#A0A973',
    esc: '#8F8F8A',
    insert: '#76A78F',
    deleted: '#DA7C7E',
    err: '#DA7C7E',
    var: '#C0BEAF',
    type: '#D1A075',
    func: '#AA9DCA',
    oper: '#878782',
  },
}
