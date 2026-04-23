import { generateLaSo } from 'tuvi-neo';

const laso = generateLaSo({
  name: "Nguyễn Văn A",
  gender: "male",
  birth: {
    isLunar: false,
    year: 1990,
    month: 5,
    day: 15,
    hour: 8,
    minute: 30
  }
});

console.log(laso.Info.Nam);
console.log(laso.Cac_cung[0].Name);
