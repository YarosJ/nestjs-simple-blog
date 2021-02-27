import { Document } from 'mongoose';

type PopulatedDocument<
    D extends Document,
    P extends Document,
    F extends string,
  > = D & { [U in F]: P };

export default PopulatedDocument;
