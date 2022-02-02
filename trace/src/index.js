import React from 'react';

const Home = () => {
  const a = 1;
  const b = 2;
  return (
    <Tag
      key={a}
      color={PROJECT_COLOR[(a + b) % 4]}
    >
      1
    </Tag>
  );
};

Home();