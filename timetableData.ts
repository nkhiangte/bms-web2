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
    { class: 'X', periods: [{ subject: 'Social Science(Lynda)' }, { subject: 'Mizo(Sharon)' }, { subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'Science(Nelson)' }, { subject: 'Science(Lalremruati)' }, { subject: 'English(Lalhruaimawii)' }, { subject: '' }] },
    { class: 'IX', periods: [{ subject: 'Science(Nelson)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Social Science(Isaac)' }, { subject: 'Social Science(Lynda)' }, { subject: 'Mizo(Sharon)' }, { subject: 'Maths(Nelson)' }, { subject: 'Science(Lalremruati)' }, { subject: '' }] },
    { class: 'VIII', periods: [{ subject: 'Social Science(Isaac)' }, { subject: 'Maths(Lynda)' }, { subject: 'Mizo(Sharon)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Science(Lalremruati)' }, { subject: 'English II(Lynda)' }, { subject: 'Social Science(Sharon)' }, { subject: '' }] },
    { class: 'VII', periods: [{ subject: 'Social Science(PS Lala)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Maths(Lynda)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'English II(Malsawmi)' }, { subject: '' }] },
    { class: 'VI', periods: [{ subject: 'Maths(Lalremruati)' }, { subject: 'English I(Judith)' }, { subject: 'Social Science(PS Lala)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'English II(Isaac)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: '' }] },
    { class: 'V', periods: [{ subject: 'English I(Judith)' }, { subject: 'English II' }, { subject: 'Maths(Lalremruati)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'EVS(PS Lala)' }, { subject: 'Cursive(Isaac)' }, { subject: '' }] },
    { class: 'IV', periods: [{ subject: 'Maths(Lalchhuanawma)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'English I(Judith)' }, { subject: 'EVS(PS Lala)' }, { subject: 'English II(Judith)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'Cursive(Saichhingpuii)' }, { subject: '' }] },
    { class: 'III', periods: [{ subject: 'Mizo(Lalhruaimawii)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'English I(Judith)' }, { subject: 'EVS(PS Lala)' }, { subject: 'Cursive(Sharon)' }, { subject: 'English II(Judith)' }, { subject: '' }] },
  ],
  TUESDAY: [
    { class: 'X', periods: [{ subject: 'Social Science(Lynda)' }, { subject: 'Social Science(Lynda)' }, { subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'Mizo(Sharon)' }, { subject: 'Science(Nelson)' }, { subject: 'English(Lalhruaimawii)' }, { subject: '' }] },
    { class: 'IX', periods: [{ subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'Social Science(Sharon)' }, { subject: 'English(Lalhruaimawii)' }, { subject: 'Science(Nelson)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Social Science(Isaac)' }, { subject: '' }] },
    { class: 'VIII', periods: [{ subject: 'Social Science(Isaac)' }, { subject: 'Social Science(Sharon)' }, { subject: 'Maths(Lynda)' }, { subject: 'Maths(Lynda)' }, { subject: 'Science(Lalremruati)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Mizo(Sharon)' }, { subject: '' }] },
    { class: 'VII', periods: [{ subject: 'Social Science(PS Lala)' }, { subject: 'Social Science(PS Lala)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'Maths(Lynda)' }, { subject: 'Maths(Lynda)' }, { subject: 'English II(Malsawmi)' }, { subject: '' }] },
    { class: 'VI', periods: [{ subject: 'Maths(Lalremruati)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'English II(Isaac)' }, { subject: 'Social Science(PS Lala)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'English I(Judith)' }, { subject: '' }] },
    { class: 'V', periods: [{ subject: 'English I(Judith)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'English II(Isaac)' }, { subject: 'EVS(PS Lala)' }, { subject: '' }] },
    { class: 'IV', periods: [{ subject: 'Maths(Lalchhuanawma)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'English II(Judith)' }, { subject: 'EVS(PS Lala)' }, { subject: 'English I(Judith)' }, { subject: 'Drawing(Sharon)' }, { subject: 'Games' }, { subject: '' }] },
    { class: 'III', periods: [{ subject: 'Mizo(Lalhruaimawii)' }, { subject: 'English I(Judith)' }, { subject: 'EVS(PS Lala)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'English II(Judith)' }, { subject: 'Games' }, { subject: '' }] },
  ],
  WEDNESDAY: [
    { class: 'X', periods: [{ subject: 'Social Science(Lynda)' }, { subject: 'English(Lalhruaimawii)' }, { subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'Mizo(Isaac)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Science(Nelson)' }, { subject: '' }] },
    { class: 'IX', periods: [{ subject: 'Science(Nelson)' }, { subject: 'Social Science(Isaac)' }, { subject: 'English(Lalhruaimawii)' }, { subject: 'Social Science(Lynda)' }, { subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'English(Lynda)' }, { subject: '' }] },
    { class: 'VIII', periods: [{ subject: 'Social Science(Isaac)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Maths(Lynda)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Mizo(Sharon)' }, { subject: 'English II(Lynda)' }, { subject: 'Games' }, { subject: '' }] },
    { class: 'VII', periods: [{ subject: 'Social Science(PS Lala)' }, { subject: 'Maths(Lynda)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'Games' }, { subject: '' }] },
    { class: 'VI', periods: [{ subject: 'Science(Lalremruati)' }, { subject: 'English I(Judith)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'English II(Isaac)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'Social Science(PS Lala)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: '' }] },
    { class: 'V', periods: [{ subject: 'English I(Judith)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'EVS(PS Lala)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'EVS(PS Lala)' }, { subject: 'Drawing(Isaac)' }, { subject: 'Drawing(Isaac)' }, { subject: '' }] },
    { class: 'IV', periods: [{ subject: 'Maths(Lalchhuanawma)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'English I(Judith)' }, { subject: 'EVS(PS Lala)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'Drawing(Saichhingpuii)' }, { subject: 'EVS(PS Lala)' }, { subject: '' }] },
    { class: 'III', periods: [{ subject: 'Mizo(Lalhruaimawii)' }, { subject: 'EVS(PS Lala)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'English I(Judith)' }, { subject: 'Drawing(Sharon)' }, { subject: 'Drawing(Sharon)' }, { subject: '' }] },
  ],
  THURSDAY: [
    { class: 'X', periods: [{ subject: 'Social Science(Lynda)' }, { subject: 'Science(Nelson)' }, { subject: 'Mizo(Isaac)' }, { subject: 'English(Lalhruaimawii)' }, { subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'Science(Lalremruati)' }, { subject: '' }] },
    { class: 'IX', periods: [{ subject: 'Science(Nelson)' }, { subject: 'English(Lalhruaimawii)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Maths(Nelson)' }, { subject: 'English II(Lynda)' }, { subject: 'Mizo(Isaac)' }, { subject: 'Social Science(Sharon)' }, { subject: '' }] },
    { class: 'VIII', periods: [{ subject: 'Social Science(Isaac)' }, { subject: 'English II(Lynda)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Social Science(Sharon)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Maths(Lynda)' }, { subject: 'Maths(Lynda)' }, { subject: '' }] },
    { class: 'VII', periods: [{ subject: 'Social Science(PS Lala)' }, { subject: 'Science(Lalremruati)' }, { subject: 'Maths(Lynda)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'English II(Malsawmi)' }, { subject: '' }] },
    { class: 'VI', periods: [{ subject: 'Science(Lalremruati)' }, { subject: 'Social Science(PS Lala)' }, { subject: 'English I(Judith)' }, { subject: 'English II(Isaac)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'Games' }, { subject: '' }] },
    { class: 'V', periods: [{ subject: 'English I(Judith)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'EVS(PS Lala)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'English II(Isaac)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'Games' }, { subject: '' }] },
    { class: 'IV', periods: [{ subject: 'Maths(Lalchhuanawma)' }, { subject: 'English II(Judith)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'EVS(PS Lala)' }, { subject: 'Drawing(Sharon)' }, { subject: 'English I(Judith)' }, { subject: 'Cursive(Saichhingpuii)' }, { subject: '' }] },
    { class: 'III', periods: [{ subject: 'Mizo(Lalhruaimawii)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'English II(Judith)' }, { subject: 'English I(Judith)' }, { subject: 'Cursive' }, { subject: 'EVS(PS Lala)' }, { subject: '' }] },
  ],
  FRIDAY: [
    { class: 'X', periods: [{ subject: 'Social Science(Lynda)' }, { subject: 'Social Science(Isaac)' }, { subject: 'Science(Nelson)' }, { subject: 'English(Lalhruaimawii)' }, { subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'Games' }, { subject: '' }] },
    { class: 'IX', periods: [{ subject: 'Maths(Nelson)' }, { subject: 'Maths(Nelson)' }, { subject: 'Social Science(Sharon)' }, { subject: 'Science(Nelson)' }, { subject: 'English(Lalhruaimawii)' }, { subject: 'Mizo(Sharon)' }, { subject: 'Games' }, { subject: '' }] },
    { class: 'VIII', periods: [{ subject: 'Social Science(Isaac)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'Science(Lalremruati)' }, { subject: 'English II(Lynda)' }, { subject: 'Maths(Lynda)' }, { subject: 'Maths(Lynda)' }, { subject: 'Mizo(Sharon)' }, { subject: '' }] },
    { class: 'VII', periods: [{ subject: 'Social Science(PS Lala)' }, { subject: 'Maths(Lynda)' }, { subject: 'Maths(Lynda)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: 'Science(Lalremruati)' }, { subject: 'English I(Lalhruaimawii)' }, { subject: 'English II(Malsawmi)' }, { subject: '' }] },
    { class: 'VI', periods: [{ subject: 'Maths(Lalremruati)' }, { subject: 'Maths(Lalremruati)' }, { subject: 'English I(Judith)' }, { subject: 'Social Science(PS Lala)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'Science(Lalremruati)' }, { subject: 'English II(Isaac)' }, { subject: '' }] },
    { class: 'V', periods: [{ subject: 'English I(Judith)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'English II' }, { subject: 'Maths(Lalremruati)' }, { subject: 'Drawing(Isaac)' }, { subject: 'Drawing(Isaac)' }, { subject: 'Mizo(Lalchhuanawma)' }, { subject: '' }] },
    { class: 'IV', periods: [{ subject: 'Mizo(Lalchhuanawma)' }, { subject: 'English I' }, { subject: 'EVS(PS Lala)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'Drawing(Lalhruaimawii)' }, { subject: '' }] },
    { class: 'III', periods: [{ subject: 'Mizo(Lalhruaimawii)' }, { subject: 'Maths(Lalchhuanawma)' }, { subject: 'Hindi(Saichhingpuii)' }, { subject: 'Drawing(Sharon)' }, { subject: 'Drawing(Sharon)' }, { subject: 'EVS(PS Lala)' }, { subject: 'English II(Judith)' }, { subject: '' }] },
  ],
};