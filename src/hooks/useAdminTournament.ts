// Re-export all admin tournament hooks from the new mutations file
export {
  useCreateTournament,
  useUpdateTournament,
  useStartTournament,
  useAdvanceRound,
  useDisqualifyPlayer,
  useGenerateCertificates,
  usePauseTournament,
  useResumeTournament,
  useCancelTournament,
  useForfeitMatch,
  useRequestArenaMatch,
  useRegisterForTournament,
} from './useTournamentMutations';

export type { CreateTournamentData } from '@/types/tournament';
