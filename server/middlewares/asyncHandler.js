export const asyncHandler = (theFunction) => {
  return (req, res, next) => {
    Promise.resolve(theFunction(req, res, next)).catch(next);
  };
}

// export const asyncHandler = (fn) => {
//   return (req, res, next) => {
//     Promise.resolve(fn(req, res, next)).catch((err) => next(err));
//   };
// };