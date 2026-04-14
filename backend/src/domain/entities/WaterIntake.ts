export interface WaterIntake {
  id: string;
  userId: string;
  amount: number; // ml
  date: Date;
  createdAt: Date;
}

export type CreateWaterIntakeDto = Omit<WaterIntake, 'id' | 'createdAt'>;
