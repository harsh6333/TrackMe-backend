-- CreateTable
CREATE TABLE "List" (
    "id" SERIAL NOT NULL,
    "tasks" JSONB[],
    "userId" INTEGER NOT NULL,
    "lists" TEXT NOT NULL,

    CONSTRAINT "List_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "Username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "notes" JSONB[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "List_userId_key" ON "List"("userId");

-- AddForeignKey
ALTER TABLE "List" ADD CONSTRAINT "List_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
