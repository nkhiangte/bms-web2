export interface Period {
  subject: string;
}

export interface ClassRoutine {
  class: string;
  periods: Period[];
}

export type DailyRoutine = ClassRoutine[];

export const timetableData: Record<string, DailyRoutine> = {
  MONDAY: [
    { class: 'Class X', periods: [{ subject: 'Social Studies(Lynda)' }, { subject: 'Mizo(Lalrinliani)' }, { subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Science(Nelson)' }] },
    { class: 'Class IX', periods: [{ subject: 'Science(Nelson)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Social Studies(Isaac)' }, { subject: 'Social Studies(Lynda)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Maths(Nelson)' }, { subject: 'Mizo(Lalrinliani)' }] },
    { class: 'Class VIII', periods: [{ subject: 'Social Studies(Isaac)' }, { subject: 'Maths(Lynda)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Science(Lalremruati)' }, { subject: 'English II(Lynda)' }, { subject: 'Social Studies(Lala)' }, { subject: 'Mizo(Lalhruaimawii)' }] },
    { class: 'Class VII', periods: [{ subject: 'Social Studies(Lala)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Maths(Lynda)' }, { subject: 'Hindi(Lalrinliani)' }, { subject: 'English I(Judith)' }, { subject: 'Mizo(Lalhruaimawii)' }, { subject: 'English II(Malsawmi)' }] },
    { class: 'Class VI', periods: [{ subject: 'Maths(Lalremruati)' }, { subject: 'English I(Judith)' }, { subject: 'Social Studies(Lala)' }, { subject: 'English II(Isaac)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'Hindi(Lalrinliani)' }, { subject: 'Science(Lalremruati)' }] },
    { class: 'Class V', periods: [{ subject: 'English I(Judith)' }, { subject: 'EVS(Lala)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'Hindi(Lalrinliani)' }, { subject: 'English II(Judith)' }, { subject: 'Cursive(Isaac)' }] },
    { class: 'Class IV', periods: [{ subject: 'Hindi(Lalrinliani)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'English I(Judith)' }, { subject: 'EVS(Lala)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'English II(Judith)' }] },
  ],
  TUESDAY: [
    { class: 'Class X', periods: [{ subject: 'Social Studies(Lynda)' }, { subject: 'Social Studies(Lynda)' }, { subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'Science(Nelson)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Social Studies(Isaac)' }] },
    { class: 'Class IX', periods: [{ subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'Social Studies(Isaac)' }, { subject: 'English(Lalhruaimawii)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Science(Nelson)' }, { subject: 'Mizo(Lalrinliani)' }] },
    { class: 'Class VIII', periods: [{ subject: 'Social Studies(Isaac)' }, { subject: 'Social Studies(Isaac)' }, { subject: 'Maths(Lynda)' }, { subject: 'Maths(Lynda)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Mizo(Lalhruaimawii)' }] },
    { class: 'Class VII', periods: [{ subject: 'Social Studies(Lala)' }, { subject: 'Social Studies(Lala)' }, { subject: 'English I(Judith)' }, { subject: 'Hindi(Lalrinliani)' }, { subject: 'Maths(Lynda)' }, { subject: 'Maths(Lynda)' }, { subject: 'English II(Malsawmi)' }] },
    { class: 'Class VI', periods: [{ subject: 'Maths(Lalremruati)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'Hindi(Lalrinliani)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'Social Studies(Lala)' }, { subject: 'English II(Isaac)' }, { subject: 'English I(Judith)' }] },
    { class: 'Class V', periods: [{ subject: 'English I(Judith)' }, { subject: 'Hindi(Lalrinliani)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'English II(Judith)' }, { subject: 'EVS(Lala)' }] },
    { class: 'Class IV', periods: [{ subject: 'Hindi(Lalrinliani)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'EVS(Lala)' }, { subject: 'English I(Judith)' }, { subject: 'Cursive(Lalchhuanawma)' }, { subject: 'Games' }] },
  ],
  WEDNESDAY: [
    { class: 'Class X', periods: [{ subject: 'Social Studies(Lynda)' }, { subject: 'English(Lalhruaimawii)' }, { subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'Mizo(Isaac)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Science(Nelson)' }] },
    { class: 'Class IX', periods: [{ subject: 'Science(Nelson)' }, { subject: 'Social Studies(Isaac)' }, { subject: 'English(Lalhruaimawii)' }, { subject: 'Social Studies(Lynda)' }, { subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'English(Lynda)' }] },
    { class: 'Class VIII', periods: [{ subject: 'Social Studies(Isaac)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Maths(Lynda)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Mizo(Lalrinliani)' }, { subject: 'Social Studies(Lala)' }, { subject: 'Games' }] },
    { class: 'Class VII', periods: [{ subject: 'Social Studies(Lala)' }, { subject: 'Maths(Lynda)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Hindi(Lalrinliani)' }, { subject: 'English I(Judith)' }, { subject: 'Mizo(Lalhruaimawii)' }, { subject: 'Games' }] },
    { class: 'Class VI', periods: [{ subject: 'Science(Lalremruati)' }, { subject: 'English I(Judith)' }, { subject: 'Hindi(Lalrinliani)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'English II(Isaac)' }, { subject: 'Social Studies(Lala)' }] },
    { class: 'Class V', periods: [{ subject: 'English I(Judith)' }, { subject: 'Hindi(Lalrinliani)' }, { subject: 'EVS(Lala)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'Drawing(Lalchhuanawma)' }, { subject: 'Drawing(Lalchhuanawma)' }] },
    { class: 'Class IV', periods: [{ subject: 'Hindi(Lalrinliani)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'English II(Judith)' }, { subject: 'EVS(Lala)' }, { subject: 'English I(Judith)' }, { subject: 'English I(Judith)' }] },
  ],
  THURSDAY: [
    { class: 'Class X', periods: [{ subject: 'Social Studies(Lynda)' }, { subject: 'Science(Nelson)' }, { subject: 'Mizo(Isaac)' }, { subject: 'English(Lalhruaimawii)' }, { subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'Science(Lalremruati)' }] },
    { class: 'Class IX', periods: [{ subject: 'Science(Nelson)' }, { subject: 'English(Lalhruaimawii)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Maths(Nelson)' }, { subject: 'English II(Lynda)' }, { subject: 'Social Studies(Isaac)' }, { subject: 'Mizo(Lalrinliani)' }] },
    { class: 'Class VIII', periods: [{ subject: 'Social Studies(Isaac)' }, { subject: 'English II(Lynda)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Social Studies(Lala)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Maths(Lynda)' }, { subject: 'Maths(Lynda)' }] },
    { class: 'Class VII', periods: [{ subject: 'Social Studies(Lala)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Maths(Lynda)' }, { subject: 'English I(Judith)' }, { subject: 'Hindi(Lalrinliani)' }, { subject: 'Mizo(Lalhruaimawii)' }, { subject: 'English II(Malsawmi)' }] },
    { class: 'Class VI', periods: [{ subject: 'Science(Lalremruati)' }, { subject: 'Social Studies(Lala)' }, { subject: 'English I(Judith)' }, { subject: 'English II(Isaac)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'Games' }] },
    { class: 'Class V', periods: [{ subject: 'English I(Judith)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'EVS(Lala)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'English II(Judith)' }, { subject: 'Hindi(Lalrinliani)' }, { subject: 'Games' }] },
    { class: 'Class IV', periods: [{ subject: 'Hindi(Lalrinliani)' }, { subject: 'English II(Judith)' }, { subject: 'Hindi(Lalrinliani)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'EVS(Lala)' }, { subject: 'Drawing(Lalchhuanawma)' }, { subject: 'Drawing(Lalchhuanawma)' }] },
  ],
  FRIDAY: [
    { class: 'Class X', periods: [{ subject: 'Social Studies(Lynda)' }, { subject: 'Social Studies(Isaac)' }, { subject: 'Science(Nelson)' }, { subject: 'English(Lalhruaimawii)' }, { subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'Games' }] },
    { class: 'Class IX', periods: [{ subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'Social Studies(Isaac)' }, { subject: 'Science(Nelson)' }, { subject: 'English(Lalhruaimawii)' }, { subject: 'Mizo(Lalrinliani)' }, { subject: 'Games' }] },
    { class: 'Class VIII', periods: [{ subject: 'Social Studies(Isaac)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Science(Lalremruati)' }, { subject: 'English II(Lynda)' }, { subject: 'Maths(Lynda)' }, { subject: 'Maths(Lynda)' }, { subject: 'Mizo(Lalhruaimawii)' }] },
    { class: 'Class VII', periods: [{ subject: 'Social Studies(Lala)' }, { subject: 'Maths(Lynda)' }, { subject: 'Maths(Lynda)' }, { subject: 'English I(Judith)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Mizo(Lalhruaimawii)' }, { subject: 'English II(Malsawmi)' }] },
    { class: 'Class VI', periods: [{ subject: 'Maths(Lalremruati)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'English I(Judith)' }, { subject: 'Social Studies(Lala)' }, { subject: 'Hindi(Lalrinliani)' }, { subject: 'Science(Lalremruati)' }, { subject: 'English II(Isaac)' }] },
    { class: 'Class V', periods: [{ subject: 'English I(Judith)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'Hindi(Lalrinliani)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'EVS(Lala)' }, { subject: 'English II(Judith)' }, { subject: 'EVS(Lala)' }] },
    { class: 'Class IV', periods: [{ subject: 'Hindi(Lalrinliani)' }, { subject: 'English I(Judith)' }, { subject: 'EVS(Lala)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'English I(Judith)' }] },
  ],
};
